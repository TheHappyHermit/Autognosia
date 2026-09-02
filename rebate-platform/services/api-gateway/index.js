require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());

app.use('/v1/api', createProxyMiddleware({
  target: process.env.REDIRECT_URL || "http://findyourvpn.com:3000/api",
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    const auth = req.headers.authorization;
    if (auth) proxyReq.setHeader('authorization', auth);
  },
  onError: (err, req, res) => {
    res.status(502).json({ error: { code: 'UPSTREAM_FAILED', message: 'upstream service unavailable' } });
  },
}));

const routes = [
  { method: 'get',    path: '/v1/api/health',                       authRequired: false },
  { method: 'post',   path: '/v1/api/auth/register',                 authRequired: false },
  { method: 'post',   path: '/v1/api/auth/verify-email',             authRequired: false },
  { method: 'post',   path: '/v1/api/auth/login',                    authRequired: false },
  { method: 'post',   path: '/v1/api/auth/refresh',                  authRequired: true  },
  { method: 'get',    path: '/v1/api/merchants',                     authRequired: false },
  { method: 'post',   path: '/v1/api/merchants',                     authRequired: true  },
  { method: 'get',    path: '/v1/api/merchants/:merchant_id',        authRequired: false },
  { method: 'get',    path: '/v1/api/campaigns',                     authRequired: false },
  { method: 'post',   path: '/v1/api/campaigns',                     authRequired: true  },
  { method: 'get',    path: '/v1/api/campaigns/:campaign_id',        authRequired: false },
  { method: 'post',   path: '/v1/api/campaigns/:campaign_id/apply',  authRequired: true  },
  { method: 'get',    path: '/v1/api/users/me/applications',         authRequired: true  },
  { method: 'get',    path: '/v1/api/users/me/transactions',         authRequired: true  },
  { method: 'post',   path: '/v1/api/users/me/wallet/deposit',       authRequired: true  },
  { method: 'post',   path: '/v1/api/users/me/wallet/withdraw',      authRequired: true  },
  { method: 'patch',  path: '/v1/api/admin/users/:user_id',          authRequired: true, requiredRole: 'admin' },
  { method: 'patch',  path: '/v1/api/merchants/:merchant_id',        authRequired: true, requiredRole: 'merchant_admin' },
  { method: 'get',    path: '/v1/api/admin/campaigns/pending',       authRequired: true, requiredRole: 'admin' },
  { method: 'patch',  path: '/v1/api/admin/campaigns/:campaign_id/status', authRequired: true, requiredRole: 'admin' },
];

routes.forEach((route) => {
   if (route.authRequired || route.requiredRole) {
     app[route.method](route.path, (req, res, next) => {
       const token = req.headers.authorization?.split(' ')?.[1];
       if (!token) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'unauthorized' } });
       try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
         if (route.requiredRole && decoded.role !== route.requiredRole) {
           return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'forbidden' } });
         }
         req.user = decoded;
         return next();
       } catch {
         return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'invalid token' } });
       }
     });
   }
 });

 app.get('/v1/api/health', (req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));
 app.get('/catalog/v1', (req, res) => res.json({ surfaces: ['web', 'mobile_ios', 'mobile_android'], defaultRedirect: { web: '/api/v1/web/signup', ios: '/api/v1/ios/signup', android: '/api/v1/android/signup' } }));
 app.get('/internal/v1', (req, res) => res.json({ db: 'postgres', cache: 'redis' }));

const PORT = process.env.API_GATEWAY_PORT || 3000;
app.listen(PORT, () => console.log(`Gateway listening port=${PORT} env=${process.env.NODE_ENV || 'development'}`));
