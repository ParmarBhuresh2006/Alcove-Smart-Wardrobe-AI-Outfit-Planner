Trained model files go here.

After training, you should see:
  clothing_classifier.pth   — PyTorch checkpoint
  label_map.json            — maps class index to label name

To train the model:
  1. Place your dataset in datasets/raw/
  2. Run: python preprocessing/dataset_inspector.py
  3. Run: python preprocessing/dataset_builder.py
  4. Run: python training/train.py
