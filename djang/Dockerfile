FROM python:slim

WORKDIR /app

RUN apt-get update && apt-get -y install gettext

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

ENTRYPOINT ["sh", "launch.sh"]
CMD ["0.0.0.0:8000"]