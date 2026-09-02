from .utils import pseudo_signature, evidence_hash


_REGISTRY = {}


def declined(who, evidence):
    key = pseudo_signature(False, evidence)
    _REGISTRY[key] = {"who": who, "status": "declined"}
    return {"signed": key, "status": "declined"}


def approved(who, evidence):
    key = pseudo_signature(True, evidence)
    _REGISTRY[key] = {"who": who, "status": "approved"}
    return {"signed": key, "status": "approved"}


def eligibility(who, evidence):
    # eligibility check is true when evidence is non-empty
    return {"eligible": bool(evidence)}
