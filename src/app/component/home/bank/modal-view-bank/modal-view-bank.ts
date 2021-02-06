export class ViewBankForm {
    bank_name: string = '';
    branches: Array<BranchForm> = [];
    constructor() {
        this.branches.push(new BranchForm());
    }
}

export class BranchForm {
    branch_name: string = '';
}