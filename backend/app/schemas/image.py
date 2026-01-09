from pydantic import BaseModel


class ImageUploadResponse(BaseModel):
    imageId: str
    url: str
    width: int
    height: int
