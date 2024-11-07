import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  Generated,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export class BaseEntity<T = any> {
  // This is what we use internally as a foreign key, but never expose to the public because leaking user counts is
  // a company trade secrets issue
  // (Running counter keys make data more local and faster to access)
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  // Already refer users by this id when in the APIs .
  // (Randomized public ids make data exposure safer)
  @Column({ unique: true, name: 'public_id' })
  @Generated('uuid')
  publicId: string;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Entity Blocked Status',
    name: 'is_blocked',
  })
  @Exclude()
  isBlocked!: boolean;

  // Nice columns for internal statistics and diagnostics
  @Column({ type: 'timestamptz', nullable: true, name: 'blocked_at' })
  @Exclude()
  blockedAt: Date;

  // Nice columns for internal statistics and diagnostics
  // We assume all servers tick UTC, but we always preserve timezone for
  // our sanity when something gets messy
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'LOCALTIMESTAMP',
    nullable: false,
    comment: 'Entity Created At',
    name: 'created_at',
  })
  createdAt!: Date;

  // Nice columns for internal statistics and diagnostics
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'LOCALTIMESTAMP',
    nullable: false,
    comment: 'Entity Updated At',
    name: 'updated_at',
  })
  updatedAt!: Date;

  // Nice columns for internal statistics and diagnostics
  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true,
    comment: 'Entity Deleted At',
    name: 'deleted_at',
  })
  deletedAt!: Date;

  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }
}
