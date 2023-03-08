import boto3
import os
import logging

def handler(event, context):
  try:
    STAGE = os.environ.get('STAGE', '')
    BUCKET = f'chapters-info-{STAGE}'

    s3 = boto3.client("s3")

    s3_response = s3.list_objects_v2(Bucket=BUCKET, Prefix='series/')
    contents = s3_response.get('Contents', [])

    object_list = [obj.get('Key', '') for obj in contents if '.json' in obj['Key']]

    event['object_list'] = object_list

    return event
  except Exception as exc:
    logging.error(f'The error {exc}')

    raise exc
