import { AffectedUser } from "./affected-user";
import { IssueDetails } from './issue-details';

export interface IssueMessage {
    occurredOn: Date,
    apiKey: string,
    issueDetails: IssueDetails
    user: AffectedUser
}
