export function bitmap(
  data: number[],
  width: number,
  height: number
): Promise<ImageBitmap> {
  return createImageBitmap(
    new ImageData(new Uint8ClampedArray(data), width, height)
  );
}
