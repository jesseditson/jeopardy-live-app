import quip from "quip-apps-api";

export interface UserImageData {
  uuid: string;
  userId?: string;
  imageURI?: string;
}

export class UserImage extends quip.apps.Record {
  static ID = "user-image";

  static getProperties() {
    return {
      userId: "string",
      imageURI: "string"
    };
  }

  static getDefaultProperties(): { [property: string]: any } {
    return {};
  }

  updateImageURI = (imageURI: string) => {
    this.set("imageURI", imageURI);
  }

  getData(): UserImageData {
    return {
      uuid: this.getId(),
      userId: this.get("userId") as string | undefined,
      imageURI: this.get("imageURI") as string | undefined,
    };
  }
}
