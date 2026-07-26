import subprocess
import sys

def run(cmd):
    print(f"Running: {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        print("STDOUT:", result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
    except Exception as e:
        print("ERROR:", e)

run("git status")
run("git remote -v")
run("git add .")
run("git commit -m \"Update dashboard and landing page styling, fix analytical bugs\"")
run("git branch -M main")
run("git remote add origin https://github.com/diya-122/FocusLearn-AI.git")
run("git pull origin main --rebase")
run("git push -u origin main")
