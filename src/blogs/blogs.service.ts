import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { User } from '../users/user.entity';

@Injectable()
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name);

  constructor(
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>,
  ) { }

  async create(createBlogDto: CreateBlogDto, user: User): Promise<Blog> {
    const blog = this.blogsRepository.create({
      ...createBlogDto,
      author: user.username,
    });
    try {
      const savedBlog = await this.blogsRepository.save(blog);
      this.logger.log(`Blog post created with ID: ${savedBlog.id}`);
      return savedBlog;
    } catch (error) {
      this.logger.error('Failed to create blog post', error);
      throw error;
    }
  }
}
