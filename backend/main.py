#!/usr/bin/env python3
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from pathlib import Path
import zork_controller

app = Flask(__name__)
cors = CORS(app)

@app.errorhandler(ValueError)
def value_error(e):
  return jsonify(error=str(e)), 422

@app.errorhandler(AssertionError)
def value_error(e):
  return jsonify(error=str(e)), 500

@app.route("/command", methods=["POST"])
def send_command():
  """Sends and command and returns the prompt history."""
  if not request.is_json:
    raise ValueError("Expected json request.")
  request_json = request.get_json()
  if "command" not in request_json:
    raise ValueError("Expected 'command'")
  if not zork_controller.is_zork_running():
    zork_controller.restart()
    raise ValueError("Zork is not running attempting to restart.")
  zork_controller.send_command()
  return jsonify(zork_controller.get_history())

@app.route("/history", methods=["GET"])
def get_history():
  """Sends returns the prompt history."""
  return jsonify(zork_controller.get_history())


def get_ssl_context():
  fullchain_path=Path('/etc/letsencrypt/live/lets-play-zork-api.sybrandt.com/fullchain.pem')
  privkey_path=Path('/etc/letsencrypt/live/lets-play-zork-api.sybrandt.com/privkey.pem')
  if fullchain_path.is_file() and privkey_path.is_file():
    return (str(fullchain_path), str(privkey_path))
  print("WARNING: Failed to get ssl cert. This only makes.")
  return None


if __name__ == "__main__":
  app.run(threaded=True, port=8080, host="0.0.0.0", ssl_context=get_ssl_context())
