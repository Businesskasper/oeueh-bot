import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { inject, injectable } from "inversify";
import { interval } from "rxjs";
import { BotRepository } from "../../db/bot-repository";
import { MessageBroker } from "../../message-broker";
import { ReminderModel } from "../../models/reminder.model";
import { TYPES } from "../../types";
import { SlashCommand } from "../slash-command";

@injectable()
export class ReminderCommand extends SlashCommand {
    private checkInterval = interval(10000);

    constructor(
        @inject(TYPES.BotRepository)
        private botRepository: BotRepository,
        @inject(TYPES.MessageBroker)
        private messageBroker: MessageBroker,
    ) {
        super();
        this.checkInterval.subscribe((_) => this.checkAndSendReminder());
    }

    public command: Omit<
        SlashCommandBuilder,
        "addSubcommand" | "addSubcommandGroup"
    > = new SlashCommandBuilder()
        .setName("reminder")
        .setDescription("Schickt dir einen friendly reminder")
        .addStringOption((option) =>
            option
                .setName("was")
                .setDescription("An was willst du erinnert werden?")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("wann")
                .setDescription("Und wann?")
                .addChoices([
                    ["1 Minute", "1min"],
                    ["10 Minuten", "10min"],
                    ["1 Stunde", "1h"],
                    ["1 Tag", "1d"],
                ])
                .setRequired(true),
        );

    public Handle(interaction: CommandInteraction): void {
        const reminderText = interaction.options.getString("was", true);
        const reminderTime = <"1min" | "10min" | "1h" | "1d">(
            interaction.options.getString("wann", true)
        );
        const userId = interaction.user.id;

        let response = "";
        const now = new Date();
        let remindDate: Date;
        switch (reminderTime) {
            case "1d":
                remindDate = new Date(now.setDate(now.getDate() + 1));
                response = `Ich erinnere dich morgen um ${remindDate.getHours()}:${remindDate.getMinutes()}`;
                break;
            case "1h":
                remindDate = new Date(now.setHours(now.getHours() + 1));
                response = `Ich erinnere dich in einer Stunde um ${remindDate.getHours()}:${remindDate.getMinutes()}`;
                break;
            case "10min":
                remindDate = new Date(now.setMinutes(now.getMinutes() + 10));
                response = `Ich erinnere dich in 10 Minuten um ${remindDate.getHours()}:${remindDate.getMinutes()}`;
                break;
            default:
                remindDate = new Date(now.setMinutes(now.getMinutes() + 1));
                response = `Ich erinnere dich in einer Minute um ${remindDate.getHours()}:${remindDate.getMinutes()}`;
                break;
        }
        this.botRepository.AddReminder({
            message: reminderText,
            date: remindDate,
            userId,
        });
        interaction.reply({
            content: `${response}\n  *${reminderText}*`,
        });
    }

    private checkAndSendReminder(): void {
        const now = new Date();
        this.botRepository
            .GetReminder()
            .filter(
                (reminder: ReminderModel) =>
                    reminder.date.valueOf() < now.valueOf(),
            )
            .forEach((reminder: ReminderModel) => {
                this.messageBroker.dispatchSendMessage({
                    messageText: `Denk dran! \n*${reminder.message}*`,
                    userId: reminder.userId,
                });
                this.botRepository.DeleteReminder(reminder.id);
            });
    }
}
