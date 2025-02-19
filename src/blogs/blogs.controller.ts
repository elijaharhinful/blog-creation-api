import { Controller, Post, Body, UseGuards, Req, HttpStatus, HttpException } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async create(@Body() createBlogDto: CreateBlogDto, @Req() req) {
    try {
      const blog = await this.blogsService.create(createBlogDto, req.user);
      return {
        status_code: HttpStatus.CREATED,
        message: 'Blog post created successfully',
        data: {
          blog_id: blog.id,
          title: blog.title,
          content: blog.content,
          image_urls: blog.image_urls,
          tags: blog.tags,
          author: blog.author,
          created_at: blog.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
