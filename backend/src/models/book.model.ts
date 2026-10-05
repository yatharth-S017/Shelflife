import { Schema, model, Document } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    ISBN: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies count is required'],
      min: [0, 'Total copies cannot be negative'],
    },
    availableCopies: {
      type: Number,
      required: [true, 'Available copies count is required'],
      min: [0, 'Available copies cannot be negative'],
      validate: {
        validator: function (this: any, val: number) {
          if (this.totalCopies !== undefined) {
            return val <= this.totalCopies;
          }
          return true;
        },
        message: 'Available copies cannot exceed total copies',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup & filtering
bookSchema.index({ genre: 1 });
bookSchema.index({ title: 'text', author: 'text' });

export const Book = model<IBook>('Book', bookSchema);
