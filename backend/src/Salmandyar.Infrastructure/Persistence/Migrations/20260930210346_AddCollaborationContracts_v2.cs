using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Salmandyar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCollaborationContracts_v2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContractTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    Code = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    CooperationType = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    ContractText = table.Column<string>(type: "text", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    EffectiveStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EffectiveEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<string>(type: "text", nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractTemplates_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ContractTemplates_AspNetUsers_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ContractAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ContractTemplateId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ContractNumber = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SignedSnapshotContractText = table.Column<string>(type: "text", nullable: true),
                    ContentHash = table.Column<string>(type: "text", nullable: true),
                    EmployerSignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EmployerUserId = table.Column<string>(type: "text", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancellationRequestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancellationReason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractAssignments_AspNetUsers_EmployerUserId",
                        column: x => x.EmployerUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ContractAssignments_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ContractAssignments_ContractTemplates_ContractTemplateId",
                        column: x => x.ContractTemplateId,
                        principalTable: "ContractTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ContractFields",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ContractTemplateId = table.Column<int>(type: "integer", nullable: false),
                    FieldKey = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Label = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    FieldType = table.Column<int>(type: "integer", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    Placeholder = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ValidationJson = table.Column<string>(type: "text", nullable: true),
                    DefaultValueFromProfile = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    OptionsJson = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractFields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractFields_ContractTemplates_ContractTemplateId",
                        column: x => x.ContractTemplateId,
                        principalTable: "ContractTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContractSigningAuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AssignmentId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    PerformedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ClientIp = table.Column<string>(type: "text", nullable: true),
                    UserAgent = table.Column<string>(type: "text", nullable: true),
                    DeviceInfoJson = table.Column<string>(type: "text", nullable: true),
                    AuthMethod = table.Column<string>(type: "text", nullable: true),
                    TransactionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContentHash = table.Column<string>(type: "text", nullable: true),
                    DetailsJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractSigningAuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractSigningAuditLogs_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ContractSigningAuditLogs_ContractAssignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "ContractAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContractFieldValues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AssignmentId = table.Column<int>(type: "integer", nullable: false),
                    ContractFieldId = table.Column<int>(type: "integer", nullable: true),
                    FieldKey = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    StringValue = table.Column<string>(type: "text", nullable: true),
                    NumberValue = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    DateValue = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractFieldValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractFieldValues_ContractAssignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "ContractAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContractFieldValues_ContractFields_ContractFieldId",
                        column: x => x.ContractFieldId,
                        principalTable: "ContractFields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "ContractTemplates",
                columns: new[] { "Id", "Code", "ContractText", "CooperationType", "CreatedAt", "CreatedByUserId", "EffectiveEndDate", "EffectiveStartDate", "IsActive", "PublishedAt", "Title", "UpdatedAt", "UpdatedByUserId", "Version" },
                values: new object[] { 1, "ELDERLY_CARE_CONTRACT", "\r\n<h2 class=\"contract-title\">قرارداد الکترونیکی ارائه خدمات مراقبت از سالمند</h2>\r\n<p class=\"contract-meta\"><strong>شماره قرارداد:</strong> {{contractNumber}} &nbsp;|&nbsp; <strong>نسخه قرارداد:</strong> {{templateVersion}} &nbsp;|&nbsp; <strong>تاریخ انعقاد:</strong> {{signDate}}</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۱ – طرفین قرارداد</h3>\r\n<p>این قرارداد در تاریخ {{startDate}} بین دو طرف زیر منعقد گردیده است:</p>\r\n<p><strong>۱-۱ کارفرما (طرف اول):</strong> سازمان یا مجموعه ارائه‌دهنده خدمات در منزل سالمندیار، که در ادامه با عنوان «کارفرما» نامیده خواهد شد.</p>\r\n<p><strong>۱-۲ پرستار / مراقب سالمند (طرف دوم):</strong> آقای/خانم <strong>{{fullName}}</strong> دارای کد ملی <strong>{{nationalCode}}</strong> و شماره تماس <strong>{{phoneNumber}}</strong> که در ادامه با عنوان «مراقب» نامیده خواهد شد و ساکن {{address}} می‌باشد.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۲ – موضوع قرارداد</h3>\r\n<p>طرف اول به موجب این قرارداد، انجام خدمات مراقبت و نگهداری از سالمند «{{elderlyFullName}}» در شهر «{{serviceCity}}» را به طرف دوم محول می‌نماید و طرف دوم نیز تعهد می‌نماید مطابق با مهارت‌ها و مدارک ارائه شده از سوی خود، به نحو احسن خدمات مقرر در این قرارداد را از تاریخ {{startDate}} ارائه نماید. نوع همکاری طرفین به شکل <strong>{{cooperationType}}</strong> و در شیفت کاری «{{workShift}}» می‌باشد.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۳ – مدت قرارداد</h3>\r\n<p>۳-۱ مدت این قرارداد از تاریخ {{startDate}} شروع شده و در تاریخ {{endDate}} به پایان می‌رسد؛ در صورتی که تاریخ پایان قرارداد ذکر نشده باشد، مدت قرارداد نامحدود در نظر گرفته شده و هر یک از طرفین می‌توانند با رعایت ماده ۱۳ قرارداد، آن را فسخ نمایند.</p>\r\n<p>۳-۲ تمدید قرارداد به صورت ضمنی در صورتی که هیچ‌یک از طرفین تا ۱۵ روز قبل از تاریخ پایان، إلغای قرارداد را کتباً به طرف دیگر اعلام ننماید، به مدت مشابه تمدید خواهد شد.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۴ – ساعات کاری و تعطیلات</h3>\r\n<p>۴-۱ ساعت کاری روزانه مراقب طبق شیفت «{{workShift}}» و بر اساس برنامه ارائه شده از سوی کارفرما به طول انجامید خواهد شد.</p>\r\n<p>۴-۲ مراقب دارای یک روز مرخصی هفتگی در طول هفته خواهد بود و تعیین روز مرخصی با تنبیع به نیاز سالمند و هماهنگی با کارفرما انجام خواهد شد.</p>\r\n<p>۴-۳ ساعات اضافه و کار در روزهای تعطیل رسمی طبق قانون کار مصوب جمهوری اسلامی ایران محاسبه و تسویه خواهد شد.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۵ – مبلغ و نحوه پرداخت حق‌الزحمه</h3>\r\n<p>۵-۱ حق‌الزحمه ماهانه طرف دوم به مبلغ <strong>{{monthlySalary}}</strong> تومان به توافق طرفین می‌رسد و کارفرما متعهد می‌گردد مبلغ مقرر را حداکثر تا پایان روز پنجم هر ماه شمسی به شماره شبا «{{iban}}» به نام «{{bankAccountOwner}}» واریز نماید.</p>\r\n<p>۵-۲ در صورت همکاری شیفتی یا ساعت‌ای، مبلغ مورد توافق طبق شیفت‌ها و در پایان هر هفته با طرف دوم تسویه خواهد شد.</p>\r\n<p>۵-۳ حق مسکن، حق خواروبار، سهم بیمه، و مزایای جانبی طبق ضمائم قرارداد و قوانین کشور الزامی خواهد بود.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۶ – وظایف و تعهدات مراقب سالمند</h3>\r\n<p>مراقب متعهد است طی مدت اعتبار قرارداد:</p>\r\n<p>۶-۱ به نحوه‌ای صادقانه و مطابق با قوانین اخلاقی حرفه‌ای و استانداردهای روز جهانی مراقبت از سالمند، کلیه امور مراقبتی سالمند را از خوراک، دارو، بهداشت شخصی، پیاده‌روی، پزشکی و تماس‌های پزشکی، همراهی در مراجعه و… به نحو احسن انجام دهد.</p>\r\n<p>۶-۲ ساعات حضور خود را مطابق برنامه‌ریزی اعلامی رعایت کرده و در موارد غیبت یا تأخیر، حداقل ۲۴ ساعت زودتر آن را به کارفرما و جانشین تعیین‌شده اطلاع دهد.</p>\r\n<p>۶-۳ در تمامی ساعات کاری از وسایل ارتباطی (تلفن همراه) فقط برای موارد ضروری مرتبط با وظیفه استفاده نموده و موبایل را در زمان‌های استراحت استفاده کند.</p>\r\n<p>۶-۴ هرگونه مشکل جسمی، روانی یا رفتاری سالمند را بلافاصله به خانواده و در موارد حاد به مرکز درمانی و اورژانس اطلاع دهد.</p>\r\n<p>۶-۵ هیچگونه مواد مخدر، نوشیدنی الکلی، دخانیات را در محوطه خانه مصرف ننماید و از افرادی که تأییدیه کارفرما را ندارند در محیط حضور ندهد.</p>\r\n<p>۶-۶ اموال سالمند و خانواده را به دقت حفظ نماید و از ورود به قسمت‌های خصوصی خانه که مرتبط با وظیفه خود نمی‌باشد، خودداری نماید.</p>\r\n<p>۶-۷ از ارائه هرگونه توصیه دارویی، تشخیص پزشکی و یا اقدام درمانی فراتر از توان و مدرک رسمی خود، خودداری نماید.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۷ – وظایف و تعهدات کارفرما</h3>\r\n<p>کارفرما متعهد است:</p>\r\n<p>۷-۱ مبلغ قراردادی را در زمان مقرر و به‌موقع به حساب مراقب واریز نماید.</p>\r\n<p>۷-۲ محیط کار سالم، امن و بهداشتی را برای مراقب فراهم نماید و در صورت اقامت در محل، تسهیلات مورد نیاز شامل اتاق مناسب و غذا را تأمین کند.</p>\r\n<p>۷-۳ وسایل و ملزومات مراقبت شامل پوشاک یکبارمصرف، دستکش، ماسک، ملزومات بهداشت فردی سالمند و داروهای روزانه را به‌موقع تأمین نماید.</p>\r\n<p>۷-۴ در مواقع اضطراری و بحرانی شامل تشدید بیماری، تصادف و… همکاری لازم با مراقب را نموده و شماره تماس‌های اضطراری و نزدیکان سالمند را در دسترس همیشه قرار دهد.</p>\r\n<p>۷-۵ حقوق کارگری، بیمه خدمات درمانی، بیمه اجتماعی و سایر مزایای قانونی طبق قوانین مصوب کشور برای مراقب را رعایت نماید.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۸ – تعهد محرمانگی اطلاعات</h3>\r\n<p>مراقب با قبول این قرارداد متعهد می‌گردد کلیه اطلاعات فردی، پزشکی، مالی و خانوادگی سالمند و خانواده که در حین انجام وظیفه به دست می‌آورد را کاملاً محرمانه تلقی کند و بدون تأیید کتبی کارفرما در اختیار هیچ شخص ثالثی قرار ندهد. این تعهد پس از پایان قرارداد نیز دارای اعتبار کامل خواهد بود.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۹ – بیمه و مسئولیت‌ها</h3>\r\n<p>۹-۱ در صورت بروز هرگونه حادثه یا آسیب جسمی یا مالی برای سالمند ناشی از قصور و غفلت اثبات‌شده مراقب، مراقب مسئول جبران خسارت می‌باشد.</p>\r\n<p>۹-۲ کارفرما می‌تواند به اختیار خود بیمه مسئولیت مدنی حرفه‌ای برای مراقب تهیه نماید و در صورت بروز هرگونه خسارت، شرکت بیمه واسطه خواهد بود.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۱۰ – شرایط اضطراری و تماس‌های فوری</h3>\r\n<p>۱۰-۱ شماره تماس اضطراری مراقب: «{{emergencyContact}}» و سایر شماره‌های نزدیکان در پرونده سالمند ثبت خواهد شد.</p>\r\n<p>۱۰-۲ در موارد سکته، ایست قلبی، سقوط از پله، خونریزی شدید و… مراقب موظف است بلافاصله با شماره ۱۱۵ تماس گرفته و در همان زمان خانواده سالمند را در جریان قرار دهد و اقدامات احیای اولیه را طبق استاندارد انجام دهد.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۱۱ – عدم واگذاری خدمات</h3>\r\n<p>مراقب متعهد است که خدمات موضوع این قرارداد را به شخص ثالثی واگذار نکند و در موارد غیبت یا بیماری فرد جانشین تأییدشده از سوی کارفرما را معرفی نماید. واگذاری غیرمجاز خدمات موجب فسخ فوری قرارداد از سوی کارفرما خواهد بود.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۱۲ – حل اختلاف‌ها</h3>\r\n<p>۱۲-۱ هرگونه اختلاف و یا مغایرت در مورد تفسیر مواد قرارداد، در مرحله اول با توافق و مذاکره دو طرف حل خواهد شد.</p>\r\n<p>۱۲-۲ در صورت عدم توافق، موضوع به داور دبیرخانه داوران صلح قضائیه شهرستان ارجاع داده خواهد شد و در صورت ناموفق بودن، مراجع قضایی صلاحیت‌دار صالح رسیدگی خواهند بود.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۱۳ – شرایط فسخ قرارداد</h3>\r\n<p>۱۳-۱ هر یک از طرفین می‌توانند با ارسال پیامک رسمی یا ایمیل تاییدشده، حداقل ۱۵ روز قبل از تاریخ مطلوب، فسخ قرارداد را اعلام نمایند.</p>\r\n<p>۱۳-۲ در موارد نقض فاحش تعهدات شامل نقض مواد ۶، ۸، ۱۱ قرارداد، کارفرما حق فسخ فوری قرارداد را بدون پرداخت خسارت خواهد داشت.</p>\r\n<p>۱۳-۳ در صورت فسخ قرارداد از سوی کارفرما بدون دلیل مشروع، حقوق یک ماه کامل به عنوان خسارت تاخیر به مراقب پرداخت می‌شود.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۱۴ – توافق و ضمائم</h3>\r\n<p>۱۴-۱ کلیه ضمائم قرارداد اعم از برنامه‌ریزی روزانه، فهرست داروها، مشخصات کامل سالمند، لیست تماس‌ها و … جزء لاینفک این قرارداد محسوب می‌گردند.</p>\r\n<p>۱۴-۲ هرگونه تغییر و اصلاح در مواد قرارداد تنها به صورت کتبی و با امضای الکترونیکی یا کتبی طرفین معتبر خواهد بود.</p>\r\n<p>۱۴-۳ طرفین اعلام می‌دارند که صلاحیت کامل جهت انعقاد این قرارداد را دارند و کلیه موارد فوق را مطالعه نموده و مورد تأیید قرار داده‌اند.</p>\r\n\r\n<h3 class=\"contract-clause-title\">ماده ۱۵ – امضا</h3>\r\n<p>با توجه به اینکه طرفین کلیه مواد ۱ تا ۱۴ را مطالعه و تأیید نموده‌اند، لذا این قرارداد با حفظ تمام مصادیق در نسخه الکترونیکی در پرونده طرفین و سامانه سالمندیار ذخیره شده و دارای اعتبار قانونی برابر با نسخه کتبی می‌باشد.</p>\r\n<div class=\"contract-signatures\">\r\n    <div class=\"sig-block\">\r\n        <p><strong>امضای الکترونیکی کارفرما:</strong></p>\r\n        <p>در صورت امضای الکترونیکی در آینده در این قسمت ثبت خواهد شد.</p>\r\n        <p>تاریخ: {{employerSignDate}}</p>\r\n    </div>\r\n    <div class=\"sig-block\">\r\n        <p><strong>امضای الکترونیکی مراقب:</strong> {{fullName}}</p>\r\n        <p>کد ملی: {{nationalCode}}</p>\r\n        <p>شماره تماس: {{phoneNumber}}</p>\r\n        <p>تاریخ امضا: {{signDate}}</p>\r\n        <p>شناسه تراکنش: {{transactionId}}</p>\r\n        <p>امضای دیجیتال (هش): {{contentHash}}</p>\r\n    </div>\r\n</div>\r\n", "مراقبت از سالمند", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "قرارداد الکترونیکی ارائه خدمات مراقبت از سالمند", null, null, 1 });

            migrationBuilder.InsertData(
                table: "ContractFields",
                columns: new[] { "Id", "ContractTemplateId", "DefaultValueFromProfile", "FieldKey", "FieldType", "IsRequired", "Label", "OptionsJson", "Order", "Placeholder", "ValidationJson" },
                values: new object[,]
                {
                    { 1, 1, "User.FirstName+LastName", "fullName", 0, true, "نام و نام خانوادگی", null, 1, null, null },
                    { 2, 1, "CaregiverProfile.NationalCode", "nationalCode", 0, true, "کد ملی", null, 2, null, null },
                    { 3, 1, "User.PhoneNumber", "phoneNumber", 0, true, "شماره تماس", null, 3, null, null },
                    { 4, 1, "CaregiverProfile.Address", "address", 4, false, "آدرس سکونت", null, 4, null, null },
                    { 5, 1, "CaregiverProfile.Iban", "iban", 0, false, "شماره شبا (IR)", null, 5, null, null },
                    { 6, 1, "CaregiverProfile.CooperationType", "cooperationType", 3, true, "نوع همکاری", "[\"تمام‌وقت\",\"نیمه‌وقت\",\"شیفتی\",\"فوق‌العاده\",\"حضوری ماهانه\"]", 6, null, null },
                    { 7, 1, "CaregiverProfile.EmploymentStartDate", "startDate", 2, true, "تاریخ شروع همکاری", null, 7, null, null },
                    { 8, 1, null, "endDate", 2, false, "تاریخ پایان همکاری (اختیاری)", null, 8, null, null },
                    { 9, 1, null, "monthlySalary", 1, false, "حقوق ماهانه (تومان)", null, 9, null, null },
                    { 10, 1, null, "workShift", 3, false, "شیفت کاری", "[\"صبح\",\"عصر\",\"شب\",\"24 ساعته\",\"طبق برنامه هفتگی\"]", 10, null, null },
                    { 11, 1, null, "elderlyFullName", 0, false, "نام و نام خانوادگی سالمند تحت پوشش", null, 11, null, null },
                    { 12, 1, null, "serviceCity", 0, false, "شهر محل خدمت", null, 12, null, null },
                    { 13, 1, "CaregiverProfile.EmergencyPhone", "emergencyContact", 0, false, "شماره تماس اضطراری", null, 13, null, null },
                    { 14, 1, "User.FirstName+LastName", "bankAccountOwner", 0, false, "نام صاحب حساب", null, 14, null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContractAssignments_ContractNumber",
                table: "ContractAssignments",
                column: "ContractNumber",
                unique: true,
                filter: "\"ContractNumber\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ContractAssignments_ContractTemplateId_Status",
                table: "ContractAssignments",
                columns: new[] { "ContractTemplateId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ContractAssignments_EmployerUserId",
                table: "ContractAssignments",
                column: "EmployerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractAssignments_UserId_Status",
                table: "ContractAssignments",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ContractFields_ContractTemplateId_FieldKey",
                table: "ContractFields",
                columns: new[] { "ContractTemplateId", "FieldKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContractFieldValues_AssignmentId_FieldKey",
                table: "ContractFieldValues",
                columns: new[] { "AssignmentId", "FieldKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContractFieldValues_ContractFieldId",
                table: "ContractFieldValues",
                column: "ContractFieldId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractSigningAuditLogs_AssignmentId_PerformedAt",
                table: "ContractSigningAuditLogs",
                columns: new[] { "AssignmentId", "PerformedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ContractSigningAuditLogs_TransactionId",
                table: "ContractSigningAuditLogs",
                column: "TransactionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContractSigningAuditLogs_UserId",
                table: "ContractSigningAuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_Code_Version",
                table: "ContractTemplates",
                columns: new[] { "Code", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_CreatedByUserId",
                table: "ContractTemplates",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_IsActive_EffectiveStartDate",
                table: "ContractTemplates",
                columns: new[] { "IsActive", "EffectiveStartDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ContractTemplates_UpdatedByUserId",
                table: "ContractTemplates",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContractFieldValues");

            migrationBuilder.DropTable(
                name: "ContractSigningAuditLogs");

            migrationBuilder.DropTable(
                name: "ContractFields");

            migrationBuilder.DropTable(
                name: "ContractAssignments");

            migrationBuilder.DropTable(
                name: "ContractTemplates");
        }
    }
}
