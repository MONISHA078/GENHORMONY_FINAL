import logging

logger = logging.getLogger("genharmony.ai_models")


class AIModelLoader:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(AIModelLoader, cls).__new__(cls, *args, **kwargs)
            cls._instance.initialized = False
        return cls._instance

    def __init__(self):
        if self.initialized:
            return
        self.text_pipeline = None
        self.speech_model = None
        self.face_cascade = None
        self.initialized = True

    def load_text_model(self):
        """
        Loads the Hugging Face text classification pipeline.
        Falls back gracefully if transformers/torch is unavailable or downloading fails.
        """
        if self.text_pipeline is not None:
            return self.text_pipeline

        try:
            from transformers import pipeline

            logger.info(
                "Initializing text classification pipeline (bhadresh-savani/distilbert-base-uncased-emotion)..."
            )
            self.text_pipeline = pipeline(
                "text-classification",
                model="bhadresh-savani/distilbert-base-uncased-emotion",
                top_k=None,  # returns scores for all emotions
            )
            logger.info("Text classification pipeline loaded successfully.")
        except Exception as e:
            logger.warning(
                f"Failed to load Hugging Face text pipeline: {e}. Fallback to lexicon analysis enabled."
            )
            self.text_pipeline = None

        return self.text_pipeline


model_loader = AIModelLoader()
