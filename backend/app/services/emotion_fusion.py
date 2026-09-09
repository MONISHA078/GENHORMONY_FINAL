import logging
from typing import Optional, Dict

logger = logging.getLogger("genharmony.emotion_fusion")

# Default weights assigned to modalities
DEFAULT_WEIGHTS = {"text": 0.35, "speech": 0.35, "face": 0.30}


class EmotionFusionService:
    def fuse_emotions(
        self,
        text_scores: Optional[Dict[str, float]] = None,
        speech_scores: Optional[Dict[str, float]] = None,
        face_scores: Optional[Dict[str, float]] = None,
        weights: Optional[Dict[str, float]] = None,
    ) -> dict:
        """
        Merges emotion scores from multiple modalities using a weighted decision fusion strategy.
        If a modality is missing, its weight is distributed proportionally.
        """
        # Load default weights if not provided
        active_weights = (weights or DEFAULT_WEIGHTS).copy()

        modalities = {"text": text_scores, "speech": speech_scores, "face": face_scores}

        # Identify which modalities are active
        active_modalities = {k: v for k, v in modalities.items() if v is not None}

        if not active_modalities:
            # If nothing is provided, return neutral CALM state
            return {
                "detected_emotion": "CALM",
                "scores": {
                    "HAPPY": 0.1,
                    "SAD": 0.1,
                    "CALM": 0.6,
                    "ANGRY": 0.1,
                    "FEAR": 0.1,
                },
            }

        # Re-normalize weights for active modalities
        total_active_weight = sum(active_weights[k] for k in active_modalities.keys())
        if total_active_weight > 0:
            active_weights = {
                k: active_weights[k] / total_active_weight
                for k in active_modalities.keys()
            }
        else:
            # Fallback equal weights if sum is zero
            equal_val = 1.0 / len(active_modalities)
            active_weights = {k: equal_val for k in active_modalities.keys()}

        # Compute fused scores
        fused_scores = {
            "HAPPY": 0.0,
            "SAD": 0.0,
            "CALM": 0.0,
            "ANGRY": 0.0,
            "FEAR": 0.0,
        }

        for modality_name, score_dict in active_modalities.items():
            weight = active_weights[modality_name]
            for emotion in fused_scores.keys():
                # Extract score, matching upper case key
                score_val = score_dict.get(
                    emotion, score_dict.get(emotion.lower(), 0.0)
                )
                fused_scores[emotion] += weight * score_val

        # Re-normalize fused scores to ensure they sum to exactly 1.0
        total_score = sum(fused_scores.values())
        if total_score > 0:
            fused_scores = {k: v / total_score for k, v in fused_scores.items()}
        else:
            fused_scores = {
                "HAPPY": 0.1,
                "SAD": 0.1,
                "CALM": 0.6,
                "ANGRY": 0.1,
                "FEAR": 0.1,
            }

        detected_emotion = max(fused_scores, key=fused_scores.get)

        logger.info(
            f"Fusion successful: Active={list(active_modalities.keys())}, weights={active_weights}, Output={detected_emotion}"
        )
        return {"detected_emotion": detected_emotion, "scores": fused_scores}


emotion_fusion_service = EmotionFusionService()
