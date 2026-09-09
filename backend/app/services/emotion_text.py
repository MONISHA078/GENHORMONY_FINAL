import re
import logging
from app.ai_models.model_loader import model_loader

logger = logging.getLogger("genharmony.emotion_text")

# Mappings from Hugging Face distilbert-emotion classes to our standard classes
# distilbert-base-uncased-emotion returns: sadness, joy, love, anger, fear, surprise
EMOTION_MAP = {
    "joy": "HAPPY",
    "love": "HAPPY",
    "surprise": "CALM",
    "sadness": "SAD",
    "anger": "ANGRY",
    "fear": "FEAR",
}

# Lexicon dictionaries for the fallback rule-based emotion matcher
LEXICON = {
    "HAPPY": [
        "happy",
        "joy",
        "glad",
        "excited",
        "cheerful",
        "smile",
        "laugh",
        "great",
        "wonderful",
        "celebrate",
        "delight",
        "sunny",
    ],
    "SAD": [
        "sad",
        "sorrow",
        "depressed",
        "lonely",
        "hopeless",
        "crying",
        "tears",
        "blue",
        "grief",
        "pain",
        "broken",
        "hurt",
    ],
    "CALM": [
        "calm",
        "peaceful",
        "relaxed",
        "serene",
        "quiet",
        "meditate",
        "chill",
        "soft",
        "ocean",
        "sleep",
        "zen",
        "neutral",
    ],
    "ANGRY": [
        "angry",
        "furious",
        "mad",
        "rage",
        "annoyed",
        "pissed",
        "hate",
        "irritated",
        "aggressive",
        "storm",
        "enemy",
    ],
    "FEAR": [
        "scared",
        "afraid",
        "terrified",
        "fear",
        "anxious",
        "panic",
        "worry",
        "nervous",
        "horror",
        "dread",
        "shaking",
    ],
}


class TextEmotionService:
    def analyze_emotion(self, text: str) -> dict:
        """
        Analyzes emotion in the provided text block.
        Returns a dict containing standard scores and the final classified emotion.
        """
        if not text.strip():
            return {
                "detected_emotion": "CALM",
                "scores": {
                    "HAPPY": 0.0,
                    "SAD": 0.0,
                    "CALM": 1.0,
                    "ANGRY": 0.0,
                    "FEAR": 0.0,
                },
            }

        # Fast-path lexicon check for instant sub-millisecond detection
        lexicon_res = self._lexicon_fallback(text)
        if lexicon_res and sum(lexicon_res["scores"].values()) > 0 and lexicon_res["detected_emotion"] != "CALM":
            # Direct strong keyword match found -> Return immediately in < 1ms
            return lexicon_res

        pipeline = model_loader.load_text_model()
        if pipeline:
            try:
                # Run HuggingFace prediction
                predictions = pipeline(text)[0]

                # Format predictions into standard classes
                scores = {
                    "HAPPY": 0.0,
                    "SAD": 0.0,
                    "CALM": 0.0,
                    "ANGRY": 0.0,
                    "FEAR": 0.0,
                }
                for pred in predictions:
                    label = pred["label"]
                    score = pred["score"]
                    mapped_label = EMOTION_MAP.get(label, "CALM")
                    scores[mapped_label] += score

                # Normalize values in case multiple labels mapped to one class
                total = sum(scores.values())
                if total > 0:
                    scores = {k: v / total for k, v in scores.items()}

                detected_emotion = max(scores, key=scores.get)
                logger.info(
                    f"HuggingFace text prediction: {detected_emotion} - {scores}"
                )
                return {"detected_emotion": detected_emotion, "scores": scores}
            except Exception as e:
                logger.error(
                    f"HuggingFace text analysis failed: {e}. Switching to lexicon fallback."
                )

        # Fallback Lexicon sentiment analysis
        return lexicon_res

    def _lexicon_fallback(self, text: str) -> dict:
        """
        Rule-based keyword matching algorithm as a lightweight fallback.
        """
        clean_text = text.lower()
        # Clean special chars
        clean_text = re.sub(r"[^\w\s]", "", clean_text)
        words = clean_text.split()

        matches = {"HAPPY": 0, "SAD": 0, "CALM": 0, "ANGRY": 0, "FEAR": 0}

        for word in words:
            for emotion, keywords in LEXICON.items():
                if word in keywords:
                    matches[emotion] += 1

        total_matches = sum(matches.values())
        if total_matches == 0:
            # Default to neutral CALM state if no terms match
            scores = {"HAPPY": 0.1, "SAD": 0.1, "CALM": 0.6, "ANGRY": 0.1, "FEAR": 0.1}
        else:
            scores = {k: v / total_matches for k, v in matches.items()}

        detected_emotion = max(scores, key=scores.get)
        logger.info(f"Lexicon fallback text prediction: {detected_emotion} - {scores}")
        return {"detected_emotion": detected_emotion, "scores": scores}


text_emotion_service = TextEmotionService()
