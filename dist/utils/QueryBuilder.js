"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
const excludeField = ['page', 'limit', 'sort', 'fields', 'searchTerm', 'join'];
class QueryBuilder {
    constructor(queryModel, query) {
        this.queryModel = queryModel;
        this.query = query;
    }
    // CASE SENSITIVE FILTERING
    filter() {
        const filter = { ...this.query };
        for (const value of excludeField) {
            delete filter[value];
        }
        this.queryModel = this.queryModel.find(filter);
        return this;
    }
    // FILTER BY DATE RANGE
    dateFilter() {
        const days = Number(this.query.dateRange);
        if (!days || isNaN(days))
            return this;
        const now = new Date();
        this.queryModel = this.queryModel.find({
            event_start: {
                $gte: now,
                $lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
            },
        });
        return this;
    }
    // TEXT BASED SEARCH ON - title, description, venue
    textSearch() {
        const searchTerm = this.query.searchTerm;
        if (!searchTerm)
            return this;
        this.queryModel = this.queryModel
            .find({ $text: { $search: searchTerm } }, { score: { $meta: 'textScore' } } // relevance score
        )
            .sort({ score: { $meta: 'textScore' } });
        return this;
    }
    // FIELD FILTERING
    select() {
        const fields = this.query.fields?.split(',').join(' ') || ''; // ex: "title description price" or "title,description,price"
        this.queryModel = this.queryModel.select(fields);
        return this;
    }
    // EVENTS BY CATEGORY
    category() {
        const categoryId = this.query.category;
        if (!categoryId) {
            return this;
        }
        this.queryModel = this.queryModel.find({ category: categoryId });
        this.queryModel = this.queryModel.sort({ boosted: -1 });
        return this;
    }
    // NEARBY EVENT QUERY
    nearby(userCurrentPosition) {
        if (!userCurrentPosition ||
            userCurrentPosition.lat == null ||
            userCurrentPosition.long == null) {
            return this;
        }
        const maxDistance = Number(this.query.nearby); // meters
        if (!maxDistance || maxDistance <= 0) {
            return this;
        }
        // Use $nearSphere inside find() condition
        const nearbyCondition = {
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [userCurrentPosition.long, userCurrentPosition.lat],
                    },
                    $maxDistance: maxDistance,
                },
            },
        };
        this.queryModel = this.queryModel.find(nearbyCondition);
        return this;
    }
    // GET EVENTS BY USER INTERESTS
    interests(interests) {
        this.queryModel = this.queryModel.find({
            category: { $in: interests },
        });
        return this;
    }
    // SORTING
    sort() {
        const sort = this.query.sort || '-createdAt'; // ex: title, or -title
        this.queryModel = this.queryModel.sort(sort);
        return this;
    }
    // PAGINATION
    paginate() {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page - 1) * limit;
        this.queryModel = this.queryModel.skip(skip).limit(limit);
        return this;
    }
    // JOIN COLLECTION DYNAMICALLY
    join() {
        const joinQuery = this.query?.join;
        if (!joinQuery) {
            return this;
        }
        const refs = joinQuery.split(',');
        refs.forEach((ref) => {
            return (this.queryModel = this.queryModel.populate({ path: ref }));
        });
        return this;
    }
    // FINALLY BUILD THE INSTANCE
    build() {
        return this.queryModel;
    }
    // Generate meta data
    async getMeta() {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const totalDocuments = await this.queryModel.model.countDocuments();
        const totalPage = Math.ceil(totalDocuments / limit);
        return {
            page,
            limit,
            total: totalDocuments,
            totalPage,
        };
    }
}
exports.QueryBuilder = QueryBuilder;
