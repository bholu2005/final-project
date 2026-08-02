class ModelEvaluator:
    """
    (NEW) Computes evaluation accuracy, precision, and recall metrics
    comparing generated code remediations against the ground-truth golden datasets.
    """
    def compute_accuracy(self, predictions, references):
        correct = 0
        total = len(predictions)
        if total == 0:
            return 0.0

        for pred, ref in zip(predictions, references):
            # Calculate simple overlap ratio
            if pred.strip() == ref.strip():
                correct += 1

        return float(correct / total)
