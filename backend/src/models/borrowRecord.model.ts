import { Schema, model, Document, Types } from 'mongoose';

export type BorrowStatus = 'issued' | 'returned' | 'overdue';

export interface IBorrowRecord extends Document {
  book: Types.ObjectId;
  member: Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: BorrowStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const borrowRecordSchema = new Schema<IBorrowRecord>(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
    },
    member: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member reference is required'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['issued', 'returned', 'overdue'],
      default: 'issued',
    },
  },
  {
    timestamps: true,
  }
);

borrowRecordSchema.index({ member: 1 });
borrowRecordSchema.index({ book: 1 });
borrowRecordSchema.index({ status: 1 });

export const BorrowRecord = model<IBorrowRecord>('BorrowRecord', borrowRecordSchema);
