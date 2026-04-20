import os
from cryptography.fernet import Fernet

def generate_and_save_key(key_path):
    """Generates a key and saves it to a file."""
    key = Fernet.generate_key()
    with open(key_path, "wb") as key_file:
        key_file.write(key)
    print(f"Key saved to {key_path}. DO NOT LOSE THIS.")

def load_key(key_path):
    """Loads the key from the current directory."""
    return open(key_path, "rb").read()

def transform_file(file_path, key, encrypt=True):
    """Encrypts or decrypts a file based on the encrypt flag."""
    f = Fernet(key)
    
    # Read the original data
    with open(file_path, "rb") as file:
        file_data = file.read()
    
    # Process data
    if encrypt:
        processed_data = f.encrypt(file_data)
        action = "Encrypted"
    else:
        processed_data = f.decrypt(file_data)
        action = "Decrypted"
    
    # Write the result back to the file
    with open(file_path, "wb") as file:
        file.write(processed_data)
    
    print(f"Successfully {action} {file_path}")

# --- EXECUTION FLOW ---
# 1. Setup
filename = "test_data.txt"
key_name = "secret.key"

# Create a dummy 100-line file for testing
with open(filename, "w") as f:
    for i in range(1, 101):
        f.write(f"This is line {i} of important data.\n")

# 2. Key Management
if not os.path.exists(key_name):
    generate_and_save_key(key_name)
key = load_key(key_name)

# 3. Action
# To encrypt:
transform_file(filename, key, encrypt=True)

# To decrypt (uncomment to run):
# transform_file(filename, key, encrypt=False)
