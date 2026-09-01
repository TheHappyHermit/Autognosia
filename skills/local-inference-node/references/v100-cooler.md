# V100 Fan Controller (ARCTIC USB HID)

## Device Details

- VID:PID `3904:F001` (ARCTIC Fan Controller)
- Connected via USB-A (NOT motherboard header — header is power-only)
- `/dev/hidraw0` created by kernel

## Detection Bug: uevent Format

Kernel reports `HID_ID=0003:00003904:0000F001` — NOT `VID:3904 PID:F001`. Match raw substrings:

```python
def find_controller():
    for uevent in glob('/sys/bus/hid/devices/*/uevent'):
        content = open(uevent).read()
        if '3904' in content and 'F001' in content:
            return '/dev/hidraw' + str(device_number)
```

## HID Report Format

```python
# Report: [0x01, PWM_byte, PWM_byte, ...] (10 ports)
# PWM byte: 0-255 (0 = off, 255 = max)
report = bytes([0x01, pwm_val, pwm_val, pwm_val, pwm_val,
                pwm_val, pwm_val, pwm_val, pwm_val, pwm_val, pwm_val])
```

## Temperature-Based Fan Curve

| GPU Temp | PWM Duty |
|----------|----------|
| < 40°C | 20% |
| 40-60°C | 20-60% linear |
| 60-80°C | 60-100% linear |
| > 80°C | 100% |

## Systemd Service

```ini
[Unit]
Description=V100 GPU Fan Controller
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 /usr/local/bin/v100-cooler.py --auto
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

## CLI Override

```bash
v100-cooler.py --set 75   # Manual 75%
v100-cooler.py --auto     # Resume temperature curve
```

## Hardware Notes

- Hardware minimum floor ~10-20% PWM (setting 0 still spins)
- Retry every 3s if controller not found (handles USB reconnection)
- Log file at `/var/log/v100-cooler.log` (needs `chmod 666`)
