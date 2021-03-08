export class ECLExpression {
    operator: string;
    conceptId: string;
    wildcard: boolean;
    term: string;
    fullTerm: string;

    constructor(operator, conceptId, wildcard, term, fullTerm) {
        this.operator = operator;
        this.conceptId = conceptId;
        this.wildcard = wildcard;
        this.term = term;
        this.fullTerm = fullTerm;
    }
}

export class ECLConjunctionExpression {
    conjunctionExpressionConstraints: ECLExpression[];

    constructor(conjunctionArray) {
        this.conjunctionExpressionConstraints = conjunctionArray;
    }
}

export class ECLDisjunctionExpression {
    disjunctionExpressionConstraints: ECLExpression[];

    constructor(disjunctionArray) {
        this.disjunctionExpressionConstraints = disjunctionArray;
    }
}
