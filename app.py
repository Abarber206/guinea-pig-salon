from flask import Flask, send_from_directory, redirect, url_for
import os

app = Flask(__name__)

@app.route('/')
def root():
    return send_from_directory('.', 'index.html')

@app.route('/guinea-pig-salon')
def guinea_pig_salon():
    return redirect(url_for('root'))

@app.route('/<path:path>')
def serve_files(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
