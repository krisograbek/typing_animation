from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import openai
import os

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)

system_message = """GPT-3.5, I need you to convert the Python code into HTML. \
Please use paragraph tags for each line of code and span tags with different CSS classes to highlight different parts of the code. \
The CSS classes should differentiate between comments, keywords, strings, function names, and variables. \

I will give you a snippet, you will return HTML paragraphs with spans. \

You must output only the HTML code. Nothing else. \
You mustn't answer any other type of prompt. If the user doesn't provide any code snippet, your answer must be N/A. \

Here are the elements with some examples: \
1. Python Keywords: from, import, def, if, not, return, elif, else \
2. Python Modules/Imports: flask, request, jsonify, Flask, CORS, load_dotenv, requests, openai, os \
3. Python Variables \
4. Python Strings: The strings between single or double quotes \
5. Methods/Functions: for example load_dotenv(), get_response(). Often after the `def` keyword. \
6. Comments: lines starting with `#` \

Empty lines must be converted to <br>.

Follow this example: \
My input with code snippet: \
```python \
from flask import Flask, request, jsonify \
import os \

# load dotenv
load_dotenv() \
# load API key \
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") \

app = Flask(__name__) \

def add_prefix_if_missing(original_string, prefix): \
    if not original_string.startswith(prefix): \
        suffix = "```" \
        return prefix + original_string + suffix \
    return original_string \
```

Your output: \
``` \
<div class="css-typing"> \
  <p><span class="keyword">from</span> <span class="module">flask</span> <span class="keyword">import</span> <span class="module">Flask</span>, <span class="module">request</span>, <span class="module">jsonify</span></p> \
  <p><span class="keyword">from</span> <span class="module">dotenv</span> <span class="keyword">import</span> <span class="module">load_dotenv</span></p> \
  <p><span class="keyword">import</span> <span class="module">os</span></p> \
  <br> \
  <p><span class="comment"># load dotenv</span></p> \
  <p><span class="method">load_dotenv()</span></p> \
  <p><span class="comment"># load API key</span></p> \
  <p><span class="variable">OPENAI_API_KEY</span> = <span class="module">os</span>.<span class="method">getenv</span>(<span class="string">"OPENAI_API_KEY"</span>)</p> \
  <br> \
  <p><span class="variable">app</span> = <span class="module">Flask</span>(<span class="string">__name__</span>)</p> \
  <br> \
  <p><span class="keyword">def</span> <span class="method">add_prefix_if_missing</span>(<span class="variable">original_string</span>, <span class="variable">prefix</span>):</p> \
  <p style="text-indent: 2em;"><span class="keyword">if</span> <span class="keyword">not</span> <span class="variable">original_string</span>.<span class="method">startswith</span>(<span class="variable">prefix</span>):</p> \
  <p style="text-indent: 4em;"><span class="variable">suffix</span> = <span class="string">"```"</span></p> \
  <p style="text-indent: 4em;"><span class="keyword">return</span> <span class="variable">prefix</span> + <span class="variable">original_string</span> + <span class="variable">suffix</span></p> \
  <p style="text-indent: 2em;"><span class="keyword">return</span> <span class="variable">original_string</span></p> \
  <br> \
</div>```"""


def add_prefix_if_missing(original_string, prefix):
    if not original_string.startswith(prefix):
        suffix = "```"
        return prefix + original_string + suffix
    return original_string


@app.route("/convert", methods=["POST"])
def convert():
    code = request.json.get("code", "")

    code = add_prefix_if_missing(code, "```python\n")

    # initialize messages
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": code},
    ]
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo", messages=messages, temperature=0.0
    )

    print(response)

    response_message = response["choices"][0]["message"]["content"]

    return jsonify({"html": response_message})
