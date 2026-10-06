import { Library, BookCopy, User } from '../models';
import { NotFoundError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';

interface LibraryData {
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
  isMain?: boolean;
  isActive?: boolean;
}

export class LibraryService {
  async list(): Promise<Library[]> {
    return Library.findAll({ order: [['isMain', 'DESC'], ['name', 'ASC']] });
  }

  async getById(id: string): Promise<Library> {
    const library = await Library.findByPk(id);
    if (!library) {
      throw new NotFoundError('Library');
    }
    return library;
  }

  async create(data: LibraryData): Promise<Library> {
    const existing = await Library.findOne({ where: { code: data.code } });
    if (existing) {
      throw new ConflictError('A library with this code already exists');
    }

    const library = await Library.create(data);
    logger.info({ action: 'library_created', libraryId: library.id });
    return library;
  }

  async update(id: string, data: Partial<LibraryData>): Promise<Library> {
    const library = await this.getById(id);
    await library.update(data);
    logger.info({ action: 'library_updated', libraryId: id });
    return library;
  }

  async remove(id: string): Promise<void> {
    const library = await this.getById(id);

    const [copies, users] = await Promise.all([
      BookCopy.count({ where: { libraryId: id } }),
      User.count({ where: { libraryId: id } }),
    ]);

    if (copies > 0 || users > 0) {
      throw new ConflictError(
        'Cannot delete a library that still has copies or members assigned'
      );
    }

    await library.destroy();
    logger.info({ action: 'library_deleted', libraryId: id });
  }
}

export const libraryService = new LibraryService();
