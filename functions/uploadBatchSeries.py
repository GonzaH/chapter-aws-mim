import boto3
import os
import logging
import json


STAGE = os.environ.get('STAGE', '')
UPLOAD_LAMBDA = f"postSeries-{STAGE}"


def invoke_new_series_lambda(body):
  lambda_client = boto3.client("lambda")
  body_as_bytes = json.dumps(body).encode('utf-8')

  lambda_client.invoke_async(FunctionName=UPLOAD_LAMBDA, InvokeArgs=json.dumps(body))


def get_info_not_in_s3(to_insert, titles):
  return [record for record in to_insert if record['title'] not in titles]


def handler(event, context):
  try:
    to_insert = event.get('to_insert', [])

    body = { 'body': to_insert }

    invoke_new_series_lambda(body)

    return "PUBLISHED"
  except Exception as ex:
    logging.error(f'The error {ex}')

    raise ex
