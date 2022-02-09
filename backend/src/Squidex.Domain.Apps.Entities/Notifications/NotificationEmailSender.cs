﻿// ==========================================================================
//  Squidex Headless CMS
// ==========================================================================
//  Copyright (c) Squidex UG (haftungsbeschraenkt)
//  All rights reserved. Licensed under the MIT license.
// ==========================================================================

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Squidex.Domain.Apps.Core;
using Squidex.Infrastructure;
using Squidex.Infrastructure.Email;
using Squidex.Shared.Identity;
using Squidex.Shared.Users;

namespace Squidex.Domain.Apps.Entities.Notifications
{
    public sealed class NotificationEmailSender : INotificationSender
    {
        private readonly IEmailSender emailSender;
        private readonly IUrlGenerator urlGenerator;
        private readonly ILogger<NotificationEmailSender> log;
        private readonly NotificationEmailTextOptions texts;

        private sealed class TemplatesVars
        {
            public IUser? User { get; set; }

            public IUser? Assigner { get; init; }

            public string AppName { get; init; }

            public long? ApiCalls { get; init; }

            public long? ApiCallsLimit { get; init; }

            public string URL { get; set; }
        }

        public bool IsActive
        {
            get => true;
        }

        public NotificationEmailSender(
            IOptions<NotificationEmailTextOptions> texts,
            IEmailSender emailSender,
            IUrlGenerator urlGenerator,
            ILogger<NotificationEmailSender> log)
        {
            this.texts = texts.Value;
            this.emailSender = emailSender;
            this.urlGenerator = urlGenerator;

            this.log = log;
        }

        public Task SendUsageAsync(IUser user, string appName, long usage, long usageLimit)
        {
            Guard.NotNull(user);
            Guard.NotNull(appName);

            var vars = new TemplatesVars
            {
                ApiCalls = usage,
                ApiCallsLimit = usageLimit,
                AppName = appName
            };

            return SendEmailAsync("Usage",
                texts.UsageSubject,
                texts.UsageBody,
                user, vars);
        }

        public Task SendInviteAsync(IUser assigner, IUser user, string appName)
        {
            Guard.NotNull(assigner);
            Guard.NotNull(user);
            Guard.NotNull(appName);

            var vars = new TemplatesVars { Assigner = assigner, AppName = appName };

            if (user.Claims.HasConsent())
            {
                return SendEmailAsync("ExistingUser",
                    texts.ExistingUserSubject,
                    texts.ExistingUserBody,
                    user, vars);
            }
            else
            {
                return SendEmailAsync("NewUser",
                    texts.NewUserSubject,
                    texts.NewUserBody,
                    user, vars);
            }
        }

        private async Task SendEmailAsync(string template, string emailSubj, string emailBody, IUser user, TemplatesVars vars)
        {
            if (string.IsNullOrWhiteSpace(emailBody))
            {
                log.LogWarning("Cannot send email to {email}: No email subject configured for template {template}.", template, user.Email);
                return;
            }

            if (string.IsNullOrWhiteSpace(emailSubj))
            {
                log.LogWarning("Cannot send email to {email}: No email body configured for template {template}.", template, user.Email);
                return;
            }

            vars.URL = urlGenerator.UI();

            vars.User = user;

            emailSubj = Format(emailSubj, vars);
            emailBody = Format(emailBody, vars);

            try
            {
                await emailSender.SendAsync(user.Email, emailSubj, emailBody);
            }
            catch (Exception ex)
            {
                log.LogError(ex, "Failed to send notification to {email}.", user.Email);
                throw;
            }
        }

        private static string Format(string text, TemplatesVars vars)
        {
            text = text.Replace("$APP_NAME", vars.AppName, StringComparison.Ordinal);

            if (vars.Assigner != null)
            {
                text = text.Replace("$ASSIGNER_EMAIL", vars.Assigner.Email, StringComparison.Ordinal);
                text = text.Replace("$ASSIGNER_NAME", vars.Assigner.Claims.DisplayName(), StringComparison.Ordinal);
            }

            if (vars.User != null)
            {
                text = text.Replace("$USER_EMAIL", vars.User.Email, StringComparison.Ordinal);
                text = text.Replace("$USER_NAME", vars.User.Claims.DisplayName(), StringComparison.Ordinal);
            }

            if (vars.ApiCallsLimit != null)
            {
                text = text.Replace("$API_CALLS_LIMIT", vars.ApiCallsLimit.ToString(), StringComparison.Ordinal);
            }

            if (vars.ApiCalls != null)
            {
                text = text.Replace("$API_CALLS", vars.ApiCalls.ToString(), StringComparison.Ordinal);
            }

            text = text.Replace("$UI_URL", vars.URL, StringComparison.Ordinal);

            return text;
        }
    }
}
