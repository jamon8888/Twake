import { logger } from "../../../../../../../core/platform/framework";
import { ListResult, Pagination } from "../../../../../framework/api/crud-service";
import { Connector } from "../connectors";
import Manager from "../manager";
import { EntityTarget } from "../types";
import { getEntityDefinition } from "../utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FindFilter = { [key: string]: any };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RemoveFilter = { [key: string]: any };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type comparisonType = [string, any];
export type FindOptions = {
  pagination?: Pagination;
  $lt?: comparisonType[];
  $lte?: comparisonType[];
  $gt?: comparisonType[];
  $gte?: comparisonType[];
};

/**
 * Repository to work with entities. Each entity type has its own repository instance.
 */
export default class Repository<EntityType> {
  manager: Manager<EntityType>;

  constructor(
    readonly connector: Connector,
    readonly table: string,
    readonly entityType: EntityTarget<EntityType>,
  ) {
    this.manager = new Manager<EntityType>(this.connector);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkEntityDefinition(): boolean {
    //TODO, check entity definition make sense from this.entityType
    return true;
  }

  async init(): Promise<this> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (this.entityType as any)() as EntityType;

    if (this.checkEntityDefinition()) {
      const { columnsDefinition, entityDefinition } = getEntityDefinition(instance);
      await this.connector.createTable(entityDefinition, columnsDefinition);
    }

    return this;
  }

  async find(filters: FindFilter, options: FindOptions = {}): Promise<ListResult<EntityType>> {
    if (!this.entityType) {
      throw Error(`Unable to find or findOne: EntityType ${this.table} not initialized`);
    }

    if (!options.pagination) {
      options.pagination = new Pagination("", "100");
    }

    return await this.connector.find(this.entityType, filters, options);
  }

  async findOne(filters: FindFilter, options: FindOptions = {}): Promise<EntityType> {
    if (!options.pagination) {
      options.pagination = new Pagination("", "1");
    }

    return (await this.find(filters, options)).getEntities()[0] || null;
  }

  async save(entity: EntityType): Promise<void> {
    logger.info("services.database.repository - Saving entity", entity);
    (await this.manager.persist(entity).flush()).reset();
  }

  async saveAll(entities: EntityType[] = []): Promise<void> {
    logger.debug("services.database.repository - Saving entities");

    entities.forEach(entity => this.manager.persist(entity));
    await (await this.manager.flush()).reset();
  }

  async remove(entity: EntityType): Promise<void> {
    await (await this.manager.remove(entity).flush()).reset();
  }
}
