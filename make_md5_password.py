import sys
import hashlib
import getpass

MIN_PASS_LEN = 6
MIN_SALT_LEN = 6
EX_DATAERR = 65

def make_md5_password(password:str, salt:str):
    try:
        if not isinstance(password, str):
            raise ValueError("Password must be a string")
        if not isinstance(salt, str):
            raise ValueError("Salt must be a string")
        if len(password) < MIN_PASS_LEN:
            raise ValueError(f"Password must be at least {MIN_PASS_LEN} characters")
        if len(salt) < MIN_SALT_LEN:
            raise ValueError(f"Salt must be at least {MIN_SALT_LEN} characters")
    except Exception as e:
        print(f"Error processing md5_password - {e}")
        sys.exit(EX_DATAERR)
    
    return hashlib.md5(f"{password}{salt}".encode("utf-8")).hexdigest()

if __name__ == "__main__":
    print("Enter Password / Salt")
    print("They will be processed as md5(pass + salt)")
    print("Password/Salt must be strings of numbers, letters, and common characters")
    print("Ctrl+C to exit\n\n")

    while True:
        pswd = getpass.getpass(f"Enter Password: (Min {MIN_PASS_LEN} characters)")
        pswd2 = getpass.getpass("Confirm Password: ")
        if pswd == pswd2: break
        print("Passwords do not match")

    salt = input(f"Enter Salt (Min {MIN_SALT_LEN} characters)): ")

    token = make_md5_password(pswd, salt)

    print(f"""
token: {token}
salt: {salt}
""")