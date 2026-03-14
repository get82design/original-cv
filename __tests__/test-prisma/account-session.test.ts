import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prismaTest } from '../../lib/prismaTest';
import { resetTestDB } from '../utils/setup';
import { createTestUser } from '../utils/create-test-user';

describe('NextAuth models: Account & Session', () => {
  beforeEach(async () => {
    await resetTestDB();
  });

  afterAll(async () => {
    await prismaTest.$disconnect();
  });

  //? 6 tests pour le model Account & Session => 6 tests ok

  //! ACCOUNT TESTS
  describe('Account model', () => {
    // 1-1: créer un compte lié à un utilisateur
    it('should create an account linked to a user', async () => {
      const user = await createTestUser();

      const account = await prismaTest.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: 'google-id-123',
          access_token: 'token',
        },
      });

      expect(account.userId).toBe(user.id);
      expect(account.provider).toBe('google');
    });

    // 1-2: ne pas pouvoir créer 2 comptes avec le même provider + providerAccountId
    it('should not allow duplicate provider + providerAccountId', async () => {
      const user = await createTestUser();

      await prismaTest.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: 'google-id-123',
        },
      });

      await expect(
        prismaTest.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: 'google-id-123',
          },
        }),
      ).rejects.toThrow();
    });

    // 1-3: suppression en cascade si l'utilisateur est supprimé
    it('should delete accounts if user is deleted', async () => {
      const user = await createTestUser();

      const account = await prismaTest.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'github',
          providerAccountId: 'github-id-123',
        },
      });

      await prismaTest.user.delete({ where: { id: user.id } });

      const found = await prismaTest.account.findUnique({ where: { id: account.id } });
      expect(found).toBeNull();
    });
  });

  //! SESSION TESTS
  describe('Session model', () => {
    // 2-1: créer une session liée à un utilisateur
    it('should create a session linked to a user', async () => {
      const user = await createTestUser();

      const session = await prismaTest.session.create({
        data: {
          userId: user.id,
          sessionToken: 'token-123',
          expires: new Date(Date.now() + 1000 * 60 * 60),
        },
      });

      expect(session.userId).toBe(user.id);
      expect(session.sessionToken).toBe('token-123');
    });

    // 2-2: ne pas pouvoir créer 2 sessions avec le même sessionToken
    it('should not allow duplicate sessionToken', async () => {
      const user = await createTestUser();

      await prismaTest.session.create({
        data: {
          userId: user.id,
          sessionToken: 'token-duplicate',
          expires: new Date(Date.now() + 1000 * 60 * 60),
        },
      });

      await expect(
        prismaTest.session.create({
          data: {
            userId: user.id,
            sessionToken: 'token-duplicate',
            expires: new Date(Date.now() + 1000 * 60 * 60),
          },
        }),
      ).rejects.toThrow();
    });

    // 2-3: suppression en cascade si l'utilisateur est supprimé
    it('should delete sessions if user is deleted', async () => {
      const user = await createTestUser();

      const session = await prismaTest.session.create({
        data: {
          userId: user.id,
          sessionToken: 'token-delete',
          expires: new Date(Date.now() + 1000 * 60 * 60),
        },
      });

      await prismaTest.user.delete({ where: { id: user.id } });

      const found = await prismaTest.session.findUnique({ where: { id: session.id } });
      expect(found).toBeNull();
    });
  });
});
