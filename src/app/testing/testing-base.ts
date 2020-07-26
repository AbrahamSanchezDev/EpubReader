const mockFile = new File([''], 'filename', { type: 'text/html' });

export class TestingData {
  public static mockFileEvent = { target: { files: [mockFile] } };
}
