import { Book } from '../models/book.model';
import { Member } from '../models/member.model';
import { BorrowRecord } from '../models/borrowRecord.model';

export const seedDatabase = async () => {
  try {
    const bookCount = await Book.countDocuments();
    if (bookCount > 0) {
      console.log('🌱 Database already seeded. Skipping initial seeding.');
      return;
    }

    console.log('🌱 Database is empty. Seeding initial library data...');

    const books = await Book.insertMany([
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        ISBN: '9780132350884',
        genre: 'Technology',
        totalCopies: 5,
        availableCopies: 4,
      },
      {
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        ISBN: '9780201633610',
        genre: 'Technology',
        totalCopies: 3,
        availableCopies: 2,
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        ISBN: '9781449373320',
        genre: 'Database & Systems',
        totalCopies: 4,
        availableCopies: 3,
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        ISBN: '9780061120084',
        genre: 'Classic Fiction',
        totalCopies: 6,
        availableCopies: 6,
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        ISBN: '9780062316097',
        genre: 'History',
        totalCopies: 2,
        availableCopies: 1,
      },
    ]);

    const members = await Member.insertMany([
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        membershipId: 'MEM-1001',
        joinedDate: new Date('2025-01-15'),
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        membershipId: 'MEM-1002',
        joinedDate: new Date('2025-02-10'),
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        membershipId: 'MEM-1003',
        joinedDate: new Date('2025-03-01'),
      },
    ]);

    // Active issued record (not overdue)
    await BorrowRecord.create({
      book: books[0]._id,
      member: members[0]._id,
      issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000), // 11 days from now
      status: 'issued',
    });

    // Overdue record for Alice (issued 20 days ago, due 6 days ago)
    await BorrowRecord.create({
      book: books[1]._id,
      member: members[0]._id,
      issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      status: 'issued',
    });

    // Returned record for Bob
    await BorrowRecord.create({
      book: books[2]._id,
      member: members[1]._id,
      issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      returnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'returned',
    });

    console.log('✅ Initial database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
};
