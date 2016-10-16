﻿// ==========================================================================
//  AppCommandHandlerTests.cs
//  PinkParrot Headless CMS
// ==========================================================================
//  Copyright (c) PinkParrot Group
//  All rights reserved.
// ==========================================================================

using System;
using System.Threading.Tasks;
using Moq;
using PinkParrot.Infrastructure;
using PinkParrot.Infrastructure.CQRS.Commands;
using PinkParrot.Read.Apps;
using PinkParrot.Read.Apps.Repositories;
using PinkParrot.Write.Apps;
using PinkParrot.Write.Apps.Commands;
using Xunit;

namespace PinkParrot.Write.Tests.Apps
{
    public class AppCommandHandlerTests
    {
        private readonly Mock<IDomainObjectFactory> domainObjectFactory = new Mock<IDomainObjectFactory>();
        private readonly Mock<IDomainObjectRepository> domainObjectRepository = new Mock<IDomainObjectRepository>();
        private readonly Mock<IAppRepository> appRepository = new Mock<IAppRepository>();
        private readonly AppCommandHandler sut;

        public AppCommandHandlerTests()
        {
            sut = new AppCommandHandler(
                domainObjectFactory.Object, 
                domainObjectRepository.Object, 
                appRepository.Object);
        }

        [Fact]
        public async Task Create_should_throw_if_a_name_with_same_name_already_exists()
        {
            appRepository.Setup(x => x.FindAppByNameAsync("my-app")).Returns(Task.FromResult(new Mock<IAppEntity>().Object)).Verifiable();

            await Assert.ThrowsAsync<ValidationException>(async () => await sut.On(new CreateApp { Name = "my-app" }));

            appRepository.VerifyAll();
        }

        [Fact]
        public async Task Create_should_create_app_if_name_is_free()
        {
            var id = Guid.NewGuid();

            var app = new AppDomainObject(id, 0);

            appRepository.Setup(x => x.FindAppByNameAsync("my-app")).Returns(Task.FromResult<IAppEntity>(null)).Verifiable();

            domainObjectFactory.Setup(x => x.CreateNew(typeof(AppDomainObject), id)).Returns(app).Verifiable();
            domainObjectRepository.Setup(x => x.SaveAsync(app, It.IsAny<Guid>())).Returns(Task.FromResult(true)).Verifiable();

            await sut.On(new CreateApp { Name = "my-app", AggregateId = id });

            appRepository.VerifyAll();
            domainObjectFactory.VerifyAll();
            domainObjectRepository.VerifyAll();
        }
    }
}
