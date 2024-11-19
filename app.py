from flask import Flask, send_from_directory
import os

app = Flask(__name__)

@app.route('/')
def serve_game():
    return send_from_directory('.', 'guinea-pig-salon.html')

@app.route('/<path:path>')
def serve_files(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)