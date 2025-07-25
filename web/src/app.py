from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

@app.route('/')
def register():
    return render_template('feed.html')

@app.route('/templates/<path:filename>')
def serve_template(filename):
    return send_from_directory('templates', filename)

if __name__ == '__main__':
    app.run(debug=True)
