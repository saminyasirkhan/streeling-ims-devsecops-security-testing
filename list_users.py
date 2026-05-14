import sqlite3

def list_users():
    conn = sqlite3.connect('backend/sql_app.db')
    cursor = conn.cursor()
    cursor.execute("SELECT username, role, is_locked FROM users")
    users = cursor.fetchall()
    for user in users:
        print(user)
    conn.close()

if __name__ == "__main__":
    list_users()
