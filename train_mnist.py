import os
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torchvision import datasets, transforms

# 1. Define exact architecture required by user
class MNISTModel(nn.Module):
    def __init__(self):
        super(MNISTModel, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, stride=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, stride=1)
        self.dropout1 = nn.Dropout(0.25)
        self.dropout2 = nn.Dropout(0.5)
        self.fc1 = nn.Linear(9216, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = self.conv1(x)
        x = F.relu(x)
        x = self.conv2(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2)
        x = self.dropout1(x)
        x = torch.flatten(x, 1)
        x = self.fc1(x)
        x = F.relu(x)
        x = self.dropout2(x)
        output = self.fc2(x)
        return output # Or log_softmax if applying loss directly

def train(model, device, train_loader, optimizer, epoch):
    model.train()
    for batch_idx, (data, target) in enumerate(train_loader):
        data, target = data.to(device), target.to(device)
        optimizer.zero_grad()
        output = model(data)
        loss = F.cross_entropy(output, target)
        loss.backward()
        optimizer.step()
        if batch_idx % 100 == 0:
            print(f'Train Epoch: {epoch} [{batch_idx * len(data)}/{len(train_loader.dataset)}] Loss: {loss.item():.6f}')

def main():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f'Using device: {device}')

    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,))
    ])
    
    # Download dataset
    dataset1 = datasets.MNIST('./data', train=True, download=True, transform=transform)
    train_loader = torch.utils.data.DataLoader(dataset1, batch_size=64, shuffle=True)

    model = MNISTModel().to(device)
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # Train for 2 epochs for decent accuracy
    for epoch in range(1, 4):
        train(model, device, train_loader, optimizer, epoch)

    # 2. Export Weights
    export_dir = "public/models/mnist_cnn"
    os.makedirs(export_dir, exist_ok=True)
    
    print(f"Exporting weights to {export_dir}...")
    
    model.eval()
    state_dict = model.cpu().state_dict()
    
    # Flatten and save to binary format (.bin)
    for name, param in state_dict.items():
        if "weight" in name or "bias" in name:
            filename = os.path.join(export_dir, f"{name.replace('.', '_')}.bin")
            # Flatten to 1D and convert to float32
            flat_param = param.detach().numpy().flatten().astype('float32')
            with open(filename, 'wb') as f:
                f.write(flat_param.tobytes())
            print(f"Saved {name} -> {filename} (Shape {param.shape}, {len(flat_param)} params)")
            
    print("Export complete!")

if __name__ == '__main__':
    main()
