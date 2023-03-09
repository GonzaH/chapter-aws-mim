import boto3
import os
import logging
import json


STAGE = os.environ.get('STAGE', '')
REGION = os.environ.get('REGION', '')
ACCOUNT_NUMBER = os.environ.get('ACCOUNT_NUMBER', '')
UPLOAD_LAMBDA = f"postSeries-{STAGE}"


def notify_series_upload_queue(body):
  sqs = boto3.client("sqs")

  sqs.send_message(QueueUrl=f'https://sqs.{REGION}.amazonaws.com/{ACCOUNT_NUMBER}/createSeriesQueue-{STAGE}', MessageBody=json.dumps(body))


def handler(event, context):
  try:
    to_insert = event.get('to_insert', [])

    notify_series_upload_queue(to_insert)

    return "PUBLISHED"
  except Exception as ex:
    logging.error(f'The error {ex}')

    raise ex
