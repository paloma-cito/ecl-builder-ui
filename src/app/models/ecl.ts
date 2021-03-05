// export class Ecl {
//     subexpressionConstraint: {
//         operator: string,
//         conceptId: string,
//         term: string,
//         wildcard: boolean
//     };
//     eclRefinement: {
//         subRefinement: {
//             eclAttributeSet: {
//                 subAttributeSet: AttributeSet
//                 conjunctionAttributeSet: AttributeSet[]
//             }
//         }
//         conjunctionSubRefinements: AttributeSet[]
//     };
//
//     constructor() {
//         this.subexpressionConstraint = {
//             operator: '',
//             conceptId: '',
//             term: '',
//             wildcard: false
//         };
//         this.eclRefinement = {
//             subRefinement: {
//                 eclAttributeSet: {
//                     subAttributeSet: new AttributeSet(),
//                     conjunctionAttributeSet: [new AttributeSet()]
//                 }
//             },
//             conjunctionSubRefinements: [new AttributeSet()]
//         };
//     }
// }
//
// export class AttributeSet {
//     attribute: {
//         attributeName: {
//             conceptId: string,
//             term: string,
//             wildcard: boolean
//         };
//         expressionComparisonOperator: string,
//         value: {
//             operator: string,
//             conceptId: string,
//             term: string,
//             wildcard: boolean
//         };
//         reverse: boolean,
//         cardinalityMin: number
//     };
//
//     constructor() {
//         this.attribute = {
//             attributeName: {
//                 conceptId: '',
//                 term: '',
//                 wildcard: false
//             },
//             expressionComparisonOperator: '',
//             value: {
//                 operator: '',
//                 conceptId: '',
//                 term: '',
//                 wildcard: false
//             },
//             reverse: false,
//             cardinalityMin: 1
//         };
//     }
// }

export class EclExpression {
    operator?: string;
    conceptId?: string;
    wildcard?: boolean;
    term?: string;
    // self: boolean;
    fullTerm?: string;

    constructor(operator?, conceptId?, wildcard?, term?, fullTerm?) {
        this.operator = operator;
        this.conceptId = conceptId;
        this.wildcard = wildcard;
        this.term = term;
        this.fullTerm = fullTerm;
    }
}

export class EclObject {
    operator?: string;
    conceptId?: string;
    wildcard?: boolean;
    term?: string;
    // self: boolean;
    fullTerm?: string;
    conjunctionExpressionConstraints?: EclExpression[];
    disjunctionExpressionConstraints?: EclExpression[];

    constructor(operator?, conceptId?, wildcard?, term?, fullTerm?, conjunctionArray?, disjunctionArray?) {
        this.operator = operator;
        this.conceptId = conceptId;
        this.wildcard = wildcard;
        this.term = term;
        this.fullTerm = fullTerm;
        this.conjunctionExpressionConstraints = conjunctionArray;
        this.disjunctionExpressionConstraints = disjunctionArray;
    }
}

export class ECLExpression {
    operator?: string;
    conceptId?: string;
    wildcard?: boolean;
    term?: string;
    fullTerm?: string;

    constructor(operator?, conceptId?, wildcard?, term?, fullTerm?) {
        this.operator = operator;
        this.conceptId = conceptId;
        this.wildcard = wildcard;
        this.term = term;
        this.fullTerm = fullTerm;
    }
}

export class ECLConjunctionExpression {
    conjunctionExpressionConstraints?: ECLExpression[];

    constructor(conjunctionArray?) {
        this.conjunctionExpressionConstraints = conjunctionArray;
    }
}

export class ECLDisjunctionExpression {
    disjunctionExpressionConstraints?: ECLExpression[];

    constructor(disjunctionArray?) {
        this.disjunctionExpressionConstraints = disjunctionArray;
    }
}
