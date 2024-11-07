import { AuthenticateGuard } from './auth.guard';

describe('AuthGuard', () => {
  it('should be defined', () => {
    expect(new AuthenticateGuard()).toBeDefined();
  });
});
