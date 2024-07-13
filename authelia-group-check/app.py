from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

@app.route('/groups')
def return_headers():
    user = request.headers.get("Remote-User", "")
    groups = request.headers.get("Remote-Groups", "")
    logging.info(groups)
    if len(groups):
        groups = groups.split(",")
    if len(groups) == 1 and groups[0] == "":
        groups = []
    resp = jsonify({
        "user": user,
        "groups": groups
    })
    resp.headers.add("Access-Control-Allow-Origin", "*")
    return resp

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
