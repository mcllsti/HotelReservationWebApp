using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Testing_IdentityDatabase_Inital_30_03.Startup))]
namespace Testing_IdentityDatabase_Inital_30_03
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
