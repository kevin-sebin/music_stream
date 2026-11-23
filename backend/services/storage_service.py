import boto3
import uuid
from botocore.client import Config

from backend.core.config import (
    AWS_ACCESS_KEY,
    AWS_BUCKET_NAME,
    AWS_REGION,
    AWS_SECRET_ACCESS_KEY,
)


def _create_s3_client():
    if not AWS_REGION:
        raise RuntimeError("AWS_REGION must be configured to create upload URLs")
    if bool(AWS_ACCESS_KEY) != bool(AWS_SECRET_ACCESS_KEY):
        raise RuntimeError(
            "AWS_ACCESS_KEY and AWS_SECRET_ACCESS_KEY must both be configured"
        )

    client_options = {
        "region_name": AWS_REGION,
        "endpoint_url": f"https://s3.{AWS_REGION}.amazonaws.com",
        "config": Config(
            signature_version="s3v4",
            s3={"addressing_style": "virtual"}
        )
    }
    if AWS_ACCESS_KEY and AWS_SECRET_ACCESS_KEY:
        client_options["aws_access_key_id"] = AWS_ACCESS_KEY
        client_options["aws_secret_access_key"] = AWS_SECRET_ACCESS_KEY
    return boto3.client("s3", **client_options)


def generateUploadUrl(playlist_id: int, content_type: str):
    allowed_types = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp'
    }
    if content_type not in allowed_types:
        raise ValueError('unsupported image format')
    if not AWS_BUCKET_NAME:
        raise RuntimeError(
            "AWS_BUCKET_NAME must be configured to create upload URLs"
        )
    extension = allowed_types[content_type]
    object_key = f'playlists/{playlist_id}/{uuid.uuid4()}.{extension}'

    upload_url = _create_s3_client().generate_presigned_url(
        ClientMethod= 'put_object',
        Params= {
            'Bucket': AWS_BUCKET_NAME,
            'Key': object_key,
            'ContentType': content_type
        },
        ExpiresIn= 300
    )
    return {
        'upload_url': upload_url,
        'object_key': object_key
    }