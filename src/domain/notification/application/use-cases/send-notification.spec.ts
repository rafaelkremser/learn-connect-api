import { SendNotificationUseCase } from './send-notification';
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository';

let inMemoryNotificationsRepository: InMemoryNotificationsRepository;
let sut: SendNotificationUseCase;

describe('Send Notification', () => {
    beforeEach(() => {
        inMemoryNotificationsRepository = new InMemoryNotificationsRepository();
        sut = new SendNotificationUseCase(inMemoryNotificationsRepository);
    });

    it('should be able to create a notification', async () => {
        const result = await sut.handle({
            recipientId: 'recipient-01',
            title: 'New notification',
            content: 'An example for response',
        });

        expect(result.isRight()).toBe(true);
        expect(inMemoryNotificationsRepository.items[0]).toEqual(
            result.value?.notification
        );
    });
});
