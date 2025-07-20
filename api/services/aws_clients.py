import os

import boto3
from boto3.resources.base import ServiceResource
from botocore.client import BaseClient
from mypy_boto3_dynamodb.service_resource import Table

class AWSClients:
    """
    AWS Clients for interacting with various AWS services.
    """

    ENV_VAR_NOT_SET_ERROR = "Environment variable {} is not set or is empty."

    def __init__(self) -> None:
        """Initialize AWS clients and resources."""
        self.dynamodb: ServiceResource = boto3.resource("dynamodb")
        self.s3: BaseClient = boto3.client("s3")

        self._init_table()
        self._init_s3_bucket()

    def _init_table(self) -> None:
        """Initialize DynamoDB table."""
        table_name = os.getenv("DYNAMO_DB_TABLE")

        if not table_name:
            raise ValueError(
                self.ENV_VAR_NOT_SET_ERROR.format("DYNAMO_DB_TABLE")
            )

        self.table: Table = self.dynamodb.Table(table_name)

    def _init_s3_bucket(self) -> None:
        """Initialize S3 bucket."""
        bucket_name = os.getenv("S3_BUCKET")

        if not bucket_name:
            raise ValueError(
                self.ENV_VAR_NOT_SET_ERROR.format("S3_BUCKET")
            )

        self.s3_bucket = bucket_name

# Dependency function
def get_aws_clients() -> AWSClients:
    return AWSClients()