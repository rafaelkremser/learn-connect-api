import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { UploadAndCreateAttachmentUseCase } from './upload-and-create-attachment'
import { FakeUploader } from 'test/storage/fake-uploader'
import { object } from 'zod'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error'

let fakeUploader: FakeUploader
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let sut: UploadAndCreateAttachmentUseCase

describe('Upload Attachment', () => {
  beforeEach(() => {
    fakeUploader = new FakeUploader()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    sut = new UploadAndCreateAttachmentUseCase(
      inMemoryAttachmentsRepository,
      fakeUploader
    )
  })

  it('should be able to upload and create an attachment', async () => {
    const result = await sut.handle({
      fileName: 'profile.png',
      fileType: 'image/png',
      body: Buffer.from(''),
    })

    console.log(result)

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      attachment: inMemoryAttachmentsRepository.items[0],
    })
    expect(fakeUploader.uploads).toHaveLength(1)
    expect(fakeUploader.uploads[0]).toEqual(
      expect.objectContaining({
        fileName: 'profile.png',
      })
    )
  })

  it('should not be able to upload an attachment with invalid file type', async () => {
    const result = await sut.handle({
      fileName: 'profile.png',
      fileType: 'image/mp3',
      body: Buffer.from(''),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError)
  })
})
