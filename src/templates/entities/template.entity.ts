import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum TemplateType {
  TEMPLATE  = 'template',  // plantilla completa (asunto + cuerpo)
  SIGNATURE = 'signature', // firma reutilizable, se inserta al final del cuerpo de una campaña
}

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('text') name: string;

  @Column({ type: 'enum', enum: TemplateType, default: TemplateType.TEMPLATE })
  type: TemplateType;

  // No aplica a firmas (type = signature)
  @Column('text', { nullable: true }) subject: string;

  @Column('text') body: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
