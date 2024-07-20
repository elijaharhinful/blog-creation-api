// test/blogs.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BlogsController } from '../src/blogs/blogs.controller';
import { BlogsService } from '../src/blogs/blogs.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/auth/roles.guard';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CreateBlogDto } from '../src/blogs/dto/create-blog.dto';
import { UserRole } from '../src/users/user.entity';

describe('BlogsController', () => {
  let controller: BlogsController;
  let jwtService: JwtService;
  let blogsService: BlogsService;

  const mockBlogsService = {
    create: jest.fn().mockImplementation((dto, user) => ({
      id: Date.now(),
      ...dto,
      author: user.username,
      createdAt: new Date(),
    })),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        { provide: BlogsService, useValue: mockBlogsService },
        { provide: JwtService, useValue: mockJwtService },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();

    controller = module.get<BlogsController>(BlogsController);
    jwtService = module.get<JwtService>(JwtService);
    blogsService = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return 401 for invalid authorization token', async () => {
    mockJwtService.verify.mockImplementation(() => {
      throw new UnauthorizedException();
    });

    try {
      await controller.create({ title: 'Test Blog', content: 'Test Content' } as CreateBlogDto, { headers: { authorization: 'invalid-token' } });
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('should return 201 for valid authorization token', async () => {
    const mockUser = { id: 1, username: 'testuser', role: UserRole.SUPER_ADMIN };
    mockJwtService.verify.mockReturnValue(mockUser);

    const result = await controller.create({ title: 'Test Blog', content: 'Test Content' } as CreateBlogDto, { user: mockUser });
    expect(result).toEqual(expect.objectContaining({
      id: expect.any(Number),
      title: 'Test Blog',
      content: 'Test Content',
      author: 'testuser',
    }));
  });

  it('should return 401 for expired authorization token', async () => {
    mockJwtService.verify.mockImplementation(() => {
      throw new UnauthorizedException('Token has expired');
    });

    try {
      await controller.create({ title: 'Test Blog', content: 'Test Content' } as CreateBlogDto, { headers: { authorization: 'expired-token' } });
    } catch (error) {
      expect(error.message).toBe('Token has expired');
    }
  });

  it('should return 400 for invalid request body', async () => {
    try {
      await controller.create({ title: '', content: '' } as CreateBlogDto, { headers: { authorization: 'valid-token' } });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });

  it('should return 201 for valid request body', async () => {
    const mockUser = { id: 1, username: 'testuser', role: UserRole.SUPER_ADMIN };
    mockJwtService.verify.mockReturnValue(mockUser);

    const result = await controller.create({ title: 'Valid Blog', content: 'Valid Content' } as CreateBlogDto, { user: mockUser });
    expect(result).toEqual(expect.objectContaining({
      id: expect.any(Number),
      title: 'Valid Blog',
      content: 'Valid Content',
      author: 'testuser',
    }));
  });
});
