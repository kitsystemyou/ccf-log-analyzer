FROM python:3.8.7
RUN apt update -y && apt upgrade -y
RUN pip install -r requirements.txt