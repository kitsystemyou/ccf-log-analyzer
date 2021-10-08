# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START gae_python38_app]
# [START gae_python3_app]
from flask import Flask,render_template, request, send_from_directory
from log_parse import parse, parse_by_users
import os

app = Flask(__name__)

@app.route("/")
def hello():
    return "server is alive"

# For iOS, iPadOS
@app.route('/apple-touch-icon-precomposed.png')
def fapple_touch_icon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'apple-touch-icon-precomposed.png', mimetype='image/vnd.microsoft.icon')

# トップページ
@app.route("/index")
def index():
    return render_template("index.html")

@app.route("/index", methods=["post"])
def post():
    data = request.form["input_data"]
    if len(data)==0:
        return render_template("index.html", raw_data=data)
    hist_data = parse.log_analyze(data)
    print("hist_data", hist_data)
    return render_template("index.html", raw_data=data, data=hist_data)


# ユーザー毎
@app.route("/users")
def users():
    return render_template("users.html", data=[])

@app.route("/users", methods=["post"])
def users_post():
    data = request.form["input_data"]
    try:
        data
        if len(data)==0:
            return render_template("users.html", raw_data=data)
    except: # 空のまま解析ボタンを押された場合
        return render_template("users.html", data=[])
    hist_data = parse_by_users.log_analyze(data)
    print("users_hist_data", hist_data)
    return render_template("users.html", raw_data=data, data=hist_data)


if __name__ == "__main__":
    app.run(port=8080,debug=True)
# [END gae_python3_app]
# [END gae_python38_app]